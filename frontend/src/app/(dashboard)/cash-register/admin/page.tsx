"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { SessionSummary } from "@/components/cash-register/session-summary"
import { formatNumber } from "@/lib/utils"
import { Search, Download, Eye, TrendingUp, TrendingDown, DollarSign, Users } from "lucide-react"

interface CashRegisterSession {
  id: string
  openingFloat: number
  totalCashSales: number
  cashIn: number
  cashOut: number
  expectedBalance: number
  closingBalance?: number
  discrepancy?: number
  openedAt: string
  closedAt?: string
  status: "OPEN" | "CLOSED"
  notes?: string
  user: {
    id: string
    name: string
  }
  branch: {
    id: string
    name: string
  }
}

export default function CashRegisterAdminPage() {
  const [sessions, setSessions] = useState<CashRegisterSession[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSession, setSelectedSession] = useState<CashRegisterSession | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [branchFilter, setBranchFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("today")

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadSessions()
  }, [currentPage, statusFilter, branchFilter, dateFilter])

  const loadSessions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      })

      if (statusFilter !== "all") params.append("status", statusFilter)
      if (branchFilter !== "all") params.append("branchId", branchFilter)
      if (dateFilter !== "all") {
        const today = new Date()
        switch (dateFilter) {
          case "today":
            params.append("startDate", new Date(today.setHours(0, 0, 0, 0)).toISOString())
            params.append("endDate", new Date(today.setHours(23, 59, 59, 999)).toISOString())
            break
          case "week":
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            params.append("startDate", weekAgo.toISOString())
            break
          case "month":
            const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            params.append("startDate", monthAgo.toISOString())
            break
        }
      }

      const response = await fetch(`/api/cash-register/admin/sessions?${params}`)
      const data = await response.json()

      if (data.success) {
        setSessions(data.data.sessions)
        setTotalPages(data.data.pagination.pages)
      }
    } catch (error) {
      console.error("Error loading sessions:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSessions = sessions.filter((session) =>
    session.user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Calculate summary statistics
  const totalSessions = filteredSessions.length
  const openSessions = filteredSessions.filter((s) => s.status === "OPEN").length
  const totalSales = filteredSessions.reduce((sum, s) => sum + s.totalCashSales, 0)
  const totalDiscrepancies = filteredSessions.reduce((sum, s) => sum + Math.abs(s.discrepancy || 0), 0)
  const sessionsWithDiscrepancies = filteredSessions.filter((s) => s.discrepancy && Math.abs(s.discrepancy) > 0).length

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cash Register Administration</h1>
            <p className="text-gray-500">Monitor and manage all cash register sessions</p>
          </div>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSessions}</div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <Users className="h-3 w-3 mr-1" />
                {openSessions} currently open
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">UGX {formatNumber(totalSales)}</div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <DollarSign className="h-3 w-3 mr-1" />
                Cash transactions
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Discrepancies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">UGX {formatNumber(totalDiscrepancies)}</div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <TrendingDown className="h-3 w-3 mr-1" />
                {sessionsWithDiscrepancies} sessions affected
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Accuracy Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {totalSessions > 0
                  ? Math.round(((totalSessions - sessionsWithDiscrepancies) / totalSessions) * 100)
                  : 0}
                %
              </div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                Sessions without issues
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-10"
                  placeholder="Search by cashier name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  <SelectItem value="main">Main Branch</SelectItem>
                  <SelectItem value="branch2">Branch 2</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sessions List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cash Register Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-500">Loading sessions...</p>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No sessions found matching your criteria</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSessions.map((session) => (
                  <div key={session.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <div className="font-medium">{session.user.name}</div>
                          <div className="text-sm text-gray-500">{session.branch.name}</div>
                        </div>
                        <Badge variant={session.status === "OPEN" ? "default" : "secondary"}>{session.status}</Badge>
                        {session.discrepancy && Math.abs(session.discrepancy) > 0 && (
                          <Badge variant="destructive">
                            {session.discrepancy > 0 ? "+" : ""}UGX {formatNumber(session.discrepancy)}
                            {session.discrepancy > 0 ? " Over" : " Short"}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-semibold">UGX {formatNumber(session.totalCashSales)}</div>
                          <div className="text-sm text-gray-500">{new Date(session.openedAt).toLocaleDateString()}</div>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedSession(session)}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Session Details</DialogTitle>
                            </DialogHeader>
                            {selectedSession && <SessionSummary session={selectedSession} />}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
                      <div>
                        <span className="text-gray-500">Opening Float:</span>
                        <div className="font-medium">UGX {formatNumber(session.openingFloat)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Cash In:</span>
                        <div className="font-medium text-blue-600">UGX {formatNumber(session.cashIn)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Cash Out:</span>
                        <div className="font-medium text-red-600">UGX {formatNumber(session.cashOut)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Expected:</span>
                        <div className="font-medium text-primary">UGX {formatNumber(session.expectedBalance)}</div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-500">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
