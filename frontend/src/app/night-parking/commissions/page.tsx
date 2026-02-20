/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNightParking } from "@/context/NightParkingContext";
import { useAuth } from "@/context/AuthContext";
import {
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  Search,
  Filter,
  Download,
  Eye,
  Users,
  TrendingUp,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import {
  NightParkingWorkerCommission,
  MarkCommissionsPaidRequest,
} from "@/src/types/nightParking";

export default function CommissionsPage() {
  const {
    commissions,
    fetchCommissions,
    markCommissionsAsPaid,
    getWorkerPerformanceAnalytics,
  } = useNightParking();
  const { currentBranchId } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterWorker, setFilterWorker] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedCommissions, setSelectedCommissions] = useState<string[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [markPaidDialog, setMarkPaidDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentNotes, setPaymentNotes] = useState("");

  // Fetch data
  useEffect(() => {
    fetchCommissions();
    fetchAnalytics();
  }, [fetchCommissions]);

  const fetchAnalytics = async () => {
    try {
      const data = await getWorkerPerformanceAnalytics({ period: "month" });
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
  };

  // Get unique workers from commissions
  const workers = Array.from(
    new Set(
      commissions
        .map((c) => c.worker?.name)
        .filter((name): name is string => !!name)
    )
  );

  // Filter commissions
  const filteredCommissions = commissions.filter((commission) => {
    const matchesSearch =
      commission.worker?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (commission.notes &&
        commission.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesWorker =
      filterWorker === "all" || commission.worker?.name === filterWorker;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "paid" && commission.isPaid) ||
      (filterStatus === "unpaid" && !commission.isPaid);

    return matchesSearch && matchesWorker && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateTotal = (commList: NightParkingWorkerCommission[]) => {
    return commList.reduce((sum, c) => sum + c.commissionAmount, 0);
  };

  const getCommissionTypeColor = (type: string) => {
    switch (type) {
      case "check_in":
        return "bg-blue-500/20 text-blue-400";
      case "check_out":
        return "bg-green-500/20 text-green-400";
      case "extension":
        return "bg-yellow-500/20 text-yellow-400";
      case "override":
        return "bg-purple-500/20 text-purple-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const formatCommissionType = (type: string) => {
    return type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const handleSelectCommission = (commissionId: string) => {
    setSelectedCommissions((prev) =>
      prev.includes(commissionId)
        ? prev.filter((id) => id !== commissionId)
        : [...prev, commissionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCommissions.length === filteredCommissions.length) {
      setSelectedCommissions([]);
    } else {
      setSelectedCommissions(filteredCommissions.map((c) => c.id));
    }
  };

  const handleMarkAsPaid = async () => {
    if (selectedCommissions.length === 0) {
      toast.error("Please select commissions to mark as paid");
      return;
    }

    if (!currentBranchId) {
      toast.error("No branch selected");
      return;
    }

    try {
      const requestData: MarkCommissionsPaidRequest = {
        commissionIds: selectedCommissions,
        branchId: currentBranchId,
        paymentDate: new Date().toISOString(),
        notes: paymentNotes || "Bulk payment processed",
      };

      await markCommissionsAsPaid(requestData);

      toast.success("Commissions marked as paid successfully!");
      setSelectedCommissions([]);
      setMarkPaidDialog(false);
      setPaymentNotes("");
      fetchCommissions();
    } catch (error: any) {
      toast.error("Failed to mark commissions as paid", {
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-xl shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Worker Commissions
                </h1>
              </div>
              <p className="text-gray-500">
                Manage and track worker commissions from parking operations
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-gray-200 text-gray-600 hover:bg-gray-50"
                onClick={() => {
                  // Export functionality
                  const csvData = [
                    ["Worker", "Amount", "Type", "Status", "Date", "Record"],
                    ...commissions.map((c) => [
                      c.worker?.name || "Unknown",
                      c.commissionAmount.toString(),
                      c.commissionType,
                      c.isPaid ? "Paid" : "Unpaid",
                      new Date(c.commissionDate).toLocaleDateString(),
                      c.record?.ticketNumber || "N/A",
                    ]),
                  ];
                  const csvContent = csvData
                    .map((row) => row.join(","))
                    .join("\n");
                  const blob = new Blob([csvContent], { type: "text/csv" });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `commissions-${new Date().toISOString().split("T")[0]}.csv`;
                  a.click();
                  toast.success("Commissions exported successfully!");
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                className="bg-gradient-to-r from-green-500 to-emerald-600"
                onClick={() => setMarkPaidDialog(true)}
                disabled={selectedCommissions.length === 0}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Paid ({selectedCommissions.length})
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 bg-white shadow-md">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {commissions.length}
                </div>
                <div className="text-gray-500">Total Commissions</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white shadow-md">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {formatCurrency(
                    calculateTotal(commissions.filter((c) => c.isPaid))
                  )}
                </div>
                <div className="text-gray-500">Total Paid</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white shadow-md">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {formatCurrency(
                    calculateTotal(commissions.filter((c) => !c.isPaid))
                  )}
                </div>
                <div className="text-gray-500">Pending Payment</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white shadow-md">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {workers.length}
                </div>
                <div className="text-gray-500">Active Workers</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <Card className="border-0 bg-white shadow-md mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search commissions..."
                    className="pl-10 bg-gray-50 border-gray-200 text-gray-900"
                  />
                </div>
              </div>
              <div>
                <Select value={filterWorker} onValueChange={setFilterWorker}>
                  <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <SelectValue placeholder="Worker" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="all">All Workers</SelectItem>
                    {workers.map((worker) => (
                      <SelectItem key={worker} value={worker}>
                        {worker}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Button
                  variant="outline"
                  className="w-full border-gray-600"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterWorker("all");
                    setFilterStatus("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Commissions List */}
          <div className="lg:col-span-2">
            <Card className="border-0 bg-white shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-brand-primary" />
                    Commissions List ({filteredCommissions.length})
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-200 text-gray-600"
                    onClick={handleSelectAll}
                  >
                    {selectedCommissions.length === filteredCommissions.length
                      ? "Deselect All"
                      : "Select All"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredCommissions.map((commission) => (
                    <div
                      key={commission.id}
                      className={`p-4 rounded-lg transition-all cursor-pointer border ${
                        selectedCommissions.includes(commission.id)
                          ? "bg-brand-primary/5 border-brand-primary/30 shadow-sm"
                          : "bg-gray-50 hover:bg-gray-100 border-transparent"
                      }`}
                      onClick={() => handleSelectCommission(commission.id)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedCommissions.includes(
                              commission.id
                            )}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSelectCommission(commission.id);
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                          />
                          <div>
                            <div className="font-semibold text-gray-900">
                              {commission.worker?.name || "Unknown Worker"}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="text-xs border-gray-200 text-gray-500"
                              >
                                {commission.record?.ticketNumber || "N/A"}
                              </Badge>
                              <Badge
                                className={getCommissionTypeColor(
                                  commission.commissionType
                                )}
                              >
                                {formatCommissionType(
                                  commission.commissionType
                                )}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Badge
                          className={
                            commission.isPaid
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }
                        >
                          {commission.isPaid ? "Paid" : "Pending"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <div className="text-xs text-gray-400 font-medium">Amount</div>
                          <div className="text-gray-900 font-bold">
                            {formatCurrency(commission.commissionAmount)}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-gray-400 font-medium">Date</div>
                          <div className="text-gray-600 text-sm">
                            {new Date(
                              commission.commissionDate
                            ).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-gray-400 font-medium">Created</div>
                          <div className="text-gray-600 text-sm">
                            {new Date(
                              commission.createdAt
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      {commission.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="text-sm text-gray-500">
                            {commission.notes}
                          </div>
                        </div>
                      )}
                      {commission.paidAt && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                          <CheckCircle className="h-3 w-3" />
                          Paid on{" "}
                          {new Date(commission.paidAt).toLocaleDateString()}
                          {commission.paidByUserId && (
                            <span className="text-gray-400">
                              by {commission.paidByUserId}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {filteredCommissions.length === 0 && (
                    <div className="text-center py-12">
                      <DollarSign className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">No commissions found</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {commissions.length === 0
                          ? "No commission records yet"
                          : "Try adjusting your search or filters"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Analytics & Summary */}
          <div className="space-y-6">
            {/* Summary Card */}
            <Card className="border-0 bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2 text-base">
                  <DollarSign className="h-5 w-5 text-brand-primary" />
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-gray-600">Total Selected</span>
                  <span className="text-gray-900 font-bold">
                    {formatCurrency(
                      calculateTotal(
                        commissions.filter((c) =>
                          selectedCommissions.includes(c.id)
                        )
                      )
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                  <span className="text-green-300">Total Paid</span>
                  <span className="text-green-400 font-semibold">
                    {formatCurrency(
                      calculateTotal(commissions.filter((c) => c.isPaid))
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-500/10 rounded-lg">
                  <span className="text-yellow-300">Pending Payment</span>
                  <span className="text-yellow-400 font-semibold">
                    {formatCurrency(
                      calculateTotal(commissions.filter((c) => !c.isPaid))
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg">
                  <span className="text-blue-300">This Month</span>
                  <span className="text-blue-400 font-semibold">
                    {formatCurrency(
                      calculateTotal(
                        commissions.filter(
                          (c) =>
                            new Date(c.commissionDate).getMonth() ===
                            new Date().getMonth()
                        )
                      )
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Worker Performance */}
            <Card className="border-0 bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2 text-base">
                  <TrendingUp className="h-5 w-5 text-brand-primary" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.slice(0, 4).map((worker, index) => (
                    <div
                      key={worker.workerId || index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {worker.worker?.name?.charAt(0) || "W"}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {worker.worker?.name || "Unknown"}
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            {worker.statistics?.totalTransactions || 0}{" "}
                            transactions
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          {formatCurrency(
                            worker.statistics?.totalCommission || 0
                          )}
                        </div>
                        <div className="text-xs text-gray-400">commission</div>
                      </div>
                    </div>
                  ))}
                  {analytics.length === 0 && (
                    <div className="text-center py-4">
                      <Users className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">
                        No performance data
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 bg-gradient-to-br from-gray-800 to-gray-900/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-600"
                  onClick={() => {
                    // Auto-select all unpaid commissions
                    const unpaidIds = commissions
                      .filter((c) => !c.isPaid)
                      .map((c) => c.id);
                    setSelectedCommissions(unpaidIds);
                    toast.success(
                      `Selected ${unpaidIds.length} unpaid commissions`
                    );
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Select All Unpaid
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-600"
                  onClick={() => {
                    const thisMonthIds = commissions
                      .filter(
                        (c) =>
                          new Date(c.commissionDate).getMonth() ===
                          new Date().getMonth()
                      )
                      .map((c) => c.id);
                    setSelectedCommissions(thisMonthIds);
                    toast.success(
                      `Selected ${thisMonthIds.length} this month's commissions`
                    );
                  }}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Select This Month
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-600"
                  onClick={() => {
                    setSelectedCommissions([]);
                    toast.success("Cleared all selections");
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Clear Selection
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mark as Paid Dialog */}
        <Dialog open={markPaidDialog} onOpenChange={setMarkPaidDialog}>
          <DialogContent className="bg-white border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-gray-900 font-bold">
                Mark Commissions as Paid
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-brand-primary/5 rounded-lg border border-brand-primary/10">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {formatCurrency(
                      calculateTotal(
                        commissions.filter((c) =>
                          selectedCommissions.includes(c.id)
                        )
                      )
                    )}
                  </div>
                  <div className="text-gray-500 text-sm font-medium">
                    Total for {selectedCommissions.length} commission
                    {selectedCommissions.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">Payment Date</Label>
                <Input
                  type="date"
                  value={new Date().toISOString().split("T")[0]}
                  disabled
                  className="bg-gray-50 border-gray-200 text-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">Reference/Notes</Label>
                <Input
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Payment reference or notes"
                  className="bg-gray-50 border-gray-200 text-gray-900"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMarkPaidDialog(false);
                    setPaymentNotes("");
                  }}
                  className="border-gray-200 text-gray-600"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleMarkAsPaid}
                  className="bg-gradient-to-r from-green-500 to-emerald-600"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Payment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
