/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  CreditCard,
  Users,
  Calendar,
  CheckCircle,
  Trash2,
  Filter,
  ChevronDown,
  ChevronUp,
  DollarSign,
} from "lucide-react";
import { useWashingBay } from "@/context/WashingBayContext";

export default function CommissionsPage() {
  const {
    getWorkerCommissions,
    fetchWorkers,
    workers,
    loading,
    markAllCommissionsAsPaidForWorker,
    markCommissionAsPaid,
    deleteCommission,
    bulkDeleteCommissions,
  } = useWashingBay();

  const [commissions, setCommissions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [workerFilter, setWorkerFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<string>("day");
  const [selectedCommissions, setSelectedCommissions] = useState<string[]>([]);
  const [expandedCommission, setExpandedCommission] = useState<string | null>(
    null
  );

  useEffect(() => {
    loadCommissions();
    fetchWorkers();
  }, [periodFilter]);

  const loadCommissions = async () => {
    try {
      const response = await getWorkerCommissions({
        period: periodFilter as "day" | "week" | "month" | "custom",
      });
      console.log("Commissions data:", response);
      setCommissions(response.commissions || []);
      setSummary(response.summary || null);
    } catch (error) {
      console.error("Failed to load commissions:", error);
    }
  };

  const handleMarkAsPaid = async (commissionId: string) => {
    if (
      window.confirm("Are you sure you want to mark this commission as paid?")
    ) {
      try {
        await markCommissionAsPaid(commissionId);
        loadCommissions(); // Reload data to ensure consistency
      } catch (error) {
        console.error("Failed to mark commission as paid:", error);
        alert("Failed to mark commission as paid");
      }
    }
  };

  const handleMarkAllPaid = async (workerId: string) => {
    if (
      window.confirm(
        "Are you sure you want to mark all commissions as paid for this worker?"
      )
    ) {
      try {
        await markAllCommissionsAsPaidForWorker(workerId, {
          period: periodFilter as "day" | "week" | "month" | "custom",
        });
        loadCommissions(); // Reload data
        setSelectedCommissions([]);
      } catch (error) {
        console.error("Failed to mark commissions as paid:", error);
        alert("Failed to mark commissions as paid");
      }
    }
  };

  const handleDeleteCommission = async (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this commission? This action cannot be undone."
      )
    ) {
      try {
        await deleteCommission(id);
        loadCommissions(); // Reload data
      } catch (error) {
        console.error("Failed to delete commission:", error);
        alert("Failed to delete commission");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCommissions.length === 0) return;

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedCommissions.length} selected commissions? This action cannot be undone.`
      )
    ) {
      try {
        await bulkDeleteCommissions(selectedCommissions);
        loadCommissions(); // Reload data
        setSelectedCommissions([]);
      } catch (error) {
        console.error("Failed to delete commissions:", error);
        alert("Failed to delete commissions");
      }
    }
  };

  const handleSelectAll = () => {
    if (selectedCommissions.length === filteredCommissions.length) {
      setSelectedCommissions([]);
    } else {
      setSelectedCommissions(filteredCommissions.map((c) => c.id));
    }
  };

  const handleSelectCommission = (id: string) => {
    setSelectedCommissions((prev) =>
      prev.includes(id)
        ? prev.filter((commissionId) => commissionId !== id)
        : [...prev, id]
    );
  };

  const toggleCommissionExpansion = (id: string) => {
    setExpandedCommission(expandedCommission === id ? null : id);
  };

  const filteredCommissions = commissions.filter((commission) => {
    const matchesSearch =
      commission.worker?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      commission.washOrder?.orderNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "paid" && commission.isPaid) ||
      (statusFilter === "unpaid" && !commission.isPaid);

    const matchesWorker =
      workerFilter === "all" || commission.workerId === workerFilter;

    return matchesSearch && matchesStatus && matchesWorker;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case "day":
        return "Today";
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      case "custom":
        return "Custom";
      default:
        return period;
    }
  };

  if (loading && !commissions.length) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading commissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Worker Commissions
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Manage and track worker payments for{" "}
            {getPeriodLabel(periodFilter).toLowerCase()}
          </p>
        </div>

        {/* Bulk Actions - Mobile First */}
        {selectedCommissions.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex-1">
              <p className="text-blue-800 font-medium text-sm">
                {selectedCommissions.length} commission
                {selectedCommissions.length !== 1 ? "s" : ""} selected
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-1 sm:flex-none"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
              >
                <CheckCircle className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Pay Selected</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards - Mobile Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card className="col-span-2 lg:col-span-1">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Total Commission
                </p>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">
                  {formatCurrency(summary?.totalCommission || 0)}
                </p>
              </div>
              <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Paid
                </p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">
                  {formatCurrency(summary?.paidCommission || 0)}
                </p>
                <p className="text-xs text-gray-500">
                  {summary?.paidCount || 0}
                </p>
              </div>
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Unpaid
                </p>
                <p className="text-lg sm:text-2xl font-bold text-orange-600">
                  {formatCurrency(summary?.unpaidCommission || 0)}
                </p>
                <p className="text-xs text-gray-500">
                  {summary?.unpaidCount || 0}
                </p>
              </div>
              <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by worker name or order number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm sm:text-base"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-full sm:w-32 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day" className="text-sm">
                    Today
                  </SelectItem>
                  <SelectItem value="week" className="text-sm">
                    This Week
                  </SelectItem>
                  <SelectItem value="month" className="text-sm">
                    This Month
                  </SelectItem>
                </SelectContent>
              </Select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </select>

              <select
                value={workerFilter}
                onChange={(e) => setWorkerFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Workers</option>
                {workers.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commissions List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">
            Commission Records
          </CardTitle>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Showing</span>{" "}
            {filteredCommissions.length} of {commissions.length}
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="space-y-2 sm:space-y-3">
            {filteredCommissions.map((commission) => (
              <div
                key={commission.id}
                className={`border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors ${
                  selectedCommissions.includes(commission.id)
                    ? "bg-blue-50 border-blue-200"
                    : ""
                } ${expandedCommission === commission.id ? "bg-gray-50" : ""}`}
              >
                {/* Mobile Compact View */}
                <div className="sm:hidden p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={selectedCommissions.includes(commission.id)}
                        onChange={() => handleSelectCommission(commission.id)}
                        className="h-4 w-4 text-blue-600 rounded flex-shrink-0"
                      />

                      <div
                        className={`p-1 rounded flex-shrink-0 ${
                          commission.isPaid ? "bg-green-100" : "bg-orange-100"
                        }`}
                      >
                        <CreditCard
                          className={`h-3 w-3 ${
                            commission.isPaid
                              ? "text-green-600"
                              : "text-orange-600"
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-1">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">
                            {commission.worker?.name || "Unknown Worker"}
                          </h3>
                          <Badge
                            variant={
                              commission.isPaid ? "default" : "secondary"
                            }
                            className="text-xs"
                          >
                            {commission.isPaid ? "Paid" : "Unpaid"}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 truncate">
                          {commission.washOrder?.orderNumber || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 text-sm">
                          {formatCurrency(
                            Number(commission.commissionAmount) || 0
                          )}
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => toggleCommissionExpansion(commission.id)}
                      >
                        {expandedCommission === commission.id ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Mobile View */}
                  {expandedCommission === commission.id && (
                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Date:</span>
                        <span>
                          {new Date(
                            commission.commissionDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      {commission.paidAt && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Paid on:</span>
                          <span className="text-green-600">
                            {new Date(commission.paidAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        {!commission.isPaid && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 flex-1 text-xs"
                              onClick={() => handleMarkAsPaid(commission.id)}
                            >
                              <DollarSign className="h-3 w-3 mr-1" />
                              Mark Paid
                            </Button>
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 flex-1 text-xs"
                              onClick={() =>
                                handleMarkAllPaid(commission.workerId)
                              }
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              All Paid
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-1 text-xs"
                          onClick={() => handleDeleteCommission(commission.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Desktop View - Improved Layout */}
                <div className="hidden sm:flex items-center gap-4 p-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedCommissions.includes(commission.id)}
                    onChange={() => handleSelectCommission(commission.id)}
                    className="h-4 w-4 text-blue-600 rounded flex-shrink-0"
                  />

                  {/* Status Icon */}
                  <div
                    className={`p-2 rounded-lg flex-shrink-0 ${
                      commission.isPaid ? "bg-green-100" : "bg-orange-100"
                    }`}
                  >
                    <CreditCard
                      className={`h-4 w-4 ${
                        commission.isPaid ? "text-green-600" : "text-orange-600"
                      }`}
                    />
                  </div>

                  {/* Commission Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {commission.worker?.name || "Unknown Worker"}
                      </h3>
                      <Badge
                        variant={commission.isPaid ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {commission.isPaid ? "Paid" : "Unpaid"}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex items-center gap-4 flex-wrap">
                        <span>
                          Order: {commission.washOrder?.orderNumber || "N/A"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(
                            commission.commissionDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      {commission.paidAt && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          Paid on{" "}
                          {new Date(commission.paidAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Amount - Always Visible */}
                  <div className="text-right flex-shrink-0 min-w-[100px]">
                    <p className="font-semibold text-gray-900 text-sm">
                      {formatCurrency(Number(commission.commissionAmount) || 0)}
                    </p>
                    <p className="text-xs text-gray-600">Commission</p>
                  </div>

                  {/* Actions - Always Visible */}
                  <div className="flex gap-2 flex-shrink-0">
                    {!commission.isPaid && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-xs"
                          onClick={() => handleMarkAsPaid(commission.id)}
                        >
                          <DollarSign className="h-3 w-3 mr-1" />
                          Mark Paid
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => handleMarkAllPaid(commission.workerId)}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          All Paid
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                      onClick={() => handleDeleteCommission(commission.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredCommissions.length === 0 && (
              <div className="text-center py-8 px-4">
                <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {commissions.length === 0
                    ? "No commissions found"
                    : "No matching commissions"}
                </h3>
                <p className="text-gray-600 text-sm">
                  {searchTerm ||
                  statusFilter !== "all" ||
                  workerFilter !== "all"
                    ? "Try adjusting your search criteria"
                    : "Commissions will appear here as workers complete orders"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
