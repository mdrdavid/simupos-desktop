"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Filter,
  Calendar,
  User,
} from "lucide-react";
import Link from "next/link";
import { useWeldingFinancials } from "@/context/WeldingFinancialContext";
import { QuoteStatus } from "@/src/types/weldingFinancials";

const getStatusColor = (status: QuoteStatus) => {
  switch (status) {
    case QuoteStatus.DRAFT:
      return "bg-gray-100 text-gray-800";
    case QuoteStatus.SENT:
      return "bg-blue-100 text-blue-800";
    case QuoteStatus.ACCEPTED:
      return "bg-green-100 text-green-800";
    case QuoteStatus.DECLINED:
      return "bg-red-100 text-red-800";
    case QuoteStatus.INVOICED:
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function QuotesPage() {
  const { quotes, deleteQuote } = useWeldingFinancials();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [standaloneFilter, setStandaloneFilter] = useState<string>("all")

  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch =
      quote.customerDetails.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === "all" || quote.status === statusFilter
    const matchesStandalone =
      standaloneFilter === "all" ||
      (standaloneFilter === "standalone" && quote.isStandalone)
    return matchesSearch && matchesStatus && matchesStandalone
  })

  const handleDelete = (quoteId: string) => {
    if (window.confirm("Are you sure you want to delete this quote?")) {
      deleteQuote(quoteId);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quotes</h1>
          <p className="text-gray-600 mt-2">
            Manage all your quotes and estimates
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/professional-hub/jobs/create">
            <Button className="bg-blue-500 hover:bg-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              New Quote from Job
            </Button>
          </Link>
          <Link href="/professional-hub/quotes/create-standalone">
            <Button className="bg-purple-500 hover:bg-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Create New Quote
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by customer or quote number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                {Object.values(QuoteStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <select
                value={standaloneFilter}
                onChange={(e) => setStandaloneFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="standalone">Standalone</option>
              </select>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotes List */}
      <div className="grid gap-6">
        {filteredQuotes.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Search className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No quotes found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first quote"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Link href="/professional-hub/quotes/create-standalone">
                  <Button className="bg-purple-500 hover:bg-purple-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Quote
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredQuotes.map((quote) => (
            <Card key={quote.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {quote.quoteNumber}
                      </h3>
                      <Badge className={getStatusColor(quote.status)}>
                        {quote.status}
                      </Badge>
                      {quote.isStandalone && (
                        <Badge className="bg-blue-100 text-blue-800">
                          Standalone
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-gray-600">
                        <User className="w-4 h-4 mr-2" />
                        <span>{quote.customerDetails.name}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          Created:{" "}
                          {new Date(quote.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {quote.validUntil && (
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>
                            Valid Until:{" "}
                            {new Date(quote.validUntil).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold text-gray-900">
                        UGX {quote.totalAmount.toLocaleString()}
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/professional-hub/quotes/${quote.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Link
                          href={`/professional-hub/quotes/${quote.id}/edit`}
                        >
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(quote.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

