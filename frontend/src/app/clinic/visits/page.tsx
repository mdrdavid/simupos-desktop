/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState } from "react"
import { useClinic } from "@/context/ClinicContext"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Calendar, User, DollarSign } from "lucide-react"
import Link from "next/link"
import type { Visit } from "@/src/types/clinic"

export default function VisitsPage() {
  const { visits, patients } = useClinic()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")

  const statuses: Visit["status"][] = ["Open", "Billed", "Completed", "Cancelled"]

  const filteredVisits = visits.filter((visit) => {
    const matchesSearch =
      visit.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visit.patient.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visit.attendingStaff?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || visit.status === statusFilter

    let matchesDate = true
    if (dateFilter !== "all") {
      const today = new Date()
      const visitDate = new Date(visit.createdAt)

      switch (dateFilter) {
        case "today":
          matchesDate = visitDate.toDateString() === today.toDateString()
          break
        case "week":
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          matchesDate = visitDate >= weekAgo
          break
        case "month":
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          matchesDate = visitDate >= monthAgo
          break
      }
    }

    return matchesSearch && matchesStatus && matchesDate
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-UG", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getStatusColor = (status: Visit["status"]) => {
    switch (status) {
      case "Open":
        return "bg-blue-100 text-blue-800"
      case "Billed":
        return "bg-yellow-100 text-yellow-800"
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visits</h1>
          <p className="text-gray-600">{filteredVisits.length} visits found</p>
        </div>
        <Link href="/clinic/visits/new">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Visit
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by patient name, ID, or staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Visits List */}
      <div className="space-y-3">
        {filteredVisits.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || statusFilter !== "all" || dateFilter !== "all" ? "No visits found" : "No visits yet"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || statusFilter !== "all" || dateFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Start your first patient visit"}
              </p>
              {!searchQuery && statusFilter === "all" && dateFilter === "all" && (
                <Link href="/clinic/visits/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Visit
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredVisits
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((visit) => (
              <Link key={visit.id} href={`/clinic/visits/${visit.id}`}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-gray-900">{visit.patient.name}</h3>
                        <Badge className={getStatusColor(visit.status)}>{visit.status}</Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(visit.total)}</p>
                        <p className="text-xs text-gray-500">{formatDateTime(visit.createdAt)}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        <span>ID: {visit.patient.patientId}</span>
                        {visit.attendingStaff && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Staff: {visit.attendingStaff}</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <span>
                          {visit.services.length} service(s)
                          {visit.medicines.length > 0 && `, ${visit.medicines.length} medicine(s)`}
                        </span>
                      </div>

                      {visit.diagnosisNotes && (
                        <p className="text-sm text-gray-600 line-clamp-2">{visit.diagnosisNotes}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
        )}
      </div>
    </div>
  )
}
