/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  MoreVertical,
  Eye,
  RefreshCw,
  Package,
} from "lucide-react";
import Link from "next/link";
import { useBranch } from "@/context/BranchContext";
import { useAuth } from "@/context/AuthContext";
import {
  createStockTransferApi,
  StockTransfer,
  TransferStatus,
} from "@/src/data/api/stock-transfer-http-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

export default function StockTransfersPage() {
  const { currentBranch } = useBranch();
  const { getAuthHeaders } = useAuth();
  const { toast } = useToast();

  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "" as TransferStatus | "",
    type: "all" as "incoming" | "outgoing" | "all",
  });
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTransfers = useCallback(async () => {
    if (!currentBranch) return;

    setLoading(true);
    try {
      const api = createStockTransferApi(getAuthHeaders);
      const response = await api.getTransfers(currentBranch.id, {
        status: filters.status || undefined,
        type: filters.type,
      });
      setTransfers(response.transfers || []);
    } catch (error) {
      console.error("Failed to fetch transfers:", error);
      toast({
        title: "Error",
        description: "Failed to load stock transfers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentBranch, getAuthHeaders, filters, toast]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  const getStatusBadge = (status: TransferStatus) => {
    switch (status) {
      case TransferStatus.PENDING:
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        );
      case TransferStatus.APPROVED:
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Approved
          </Badge>
        );
      case TransferStatus.IN_TRANSIT:
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            In Transit
          </Badge>
        );
      case TransferStatus.COMPLETED:
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Completed
          </Badge>
        );
      case TransferStatus.REJECTED:
        return <Badge variant="destructive">Rejected</Badge>;
      case TransferStatus.CANCELLED:
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredTransfers = transfers.filter(
    (t) =>
      t.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.fromBranch?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.toBranch?.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/inventory">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Stock Transfers
            </h1>
            <p className="text-gray-600">
              Manage stock movement between branches
            </p>
          </div>
        </div>
        <Link href="/inventory/transfers/new" className="w-full sm:w-auto">
          <Button className="w-full bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            New Transfer
          </Button>
        </Link>
      </div>

      {/* Filters Card */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative col-span-1 sm:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by reference or branch"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div>
              <Select
                value={filters.type}
                onValueChange={(value: any) =>
                  setFilters((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Transfer Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transfers</SelectItem>
                  <SelectItem value="outgoing">Outgoing</SelectItem>
                  <SelectItem value="incoming">Incoming</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={filters.status}
                onValueChange={(value: any) =>
                  setFilters((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value={TransferStatus.PENDING}>
                    Pending
                  </SelectItem>
                  <SelectItem value={TransferStatus.APPROVED}>
                    Approved
                  </SelectItem>
                  <SelectItem value={TransferStatus.IN_TRANSIT}>
                    In Transit
                  </SelectItem>
                  <SelectItem value={TransferStatus.COMPLETED}>
                    Completed
                  </SelectItem>
                  <SelectItem value={TransferStatus.REJECTED}>
                    Rejected
                  </SelectItem>
                  <SelectItem value={TransferStatus.CANCELLED}>
                    Cancelled
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transfers Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Transfer History</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchTransfers}
            disabled={loading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-gray-500"
                    >
                      Loading transfers...
                    </TableCell>
                  </TableRow>
                ) : filteredTransfers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-gray-500"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Package className="w-12 h-12 text-gray-300" />
                        <p>No transfers found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransfers.map((transfer) => {
                    const isOutgoing =
                      transfer.fromBranchId === currentBranch?.id;
                    return (
                      <TableRow key={transfer.id}>
                        <TableCell className="font-medium">
                          {transfer.referenceNumber}
                        </TableCell>
                        <TableCell>
                          {isOutgoing ? (
                            <span className="flex items-center text-orange-600">
                              <ArrowUpRight className="w-4 h-4 mr-1" />
                              Outgoing
                            </span>
                          ) : (
                            <span className="flex items-center text-green-600">
                              <ArrowDownLeft className="w-4 h-4 mr-1" />
                              Incoming
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {isOutgoing ? (
                            <span className="text-gray-600">
                              To: {transfer.toBranch?.name}
                            </span>
                          ) : (
                            <span className="text-gray-600">
                              From: {transfer.fromBranch?.name}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {transfer.items?.length || 0} items
                        </TableCell>
                        <TableCell>
                          {formatCurrency(transfer.totalValue || 0)}
                        </TableCell>
                        <TableCell>{getStatusBadge(transfer.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(transfer.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/inventory/transfers/${transfer.id}`}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
