/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { toast } from "sonner";
import {
  Trash,
  Undo,
  ShieldAlert,
  Loader2,
  RefreshCw,
  User,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useBranch } from "@/context/BranchContext";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { httpClient } from "@/src/data/api/httpClient";

interface SoftDeletedTransaction {
  id: string;
  transactionId: string;
  amount: number;
  createdAt: string;
  deletedAt: string;
  itemsCount: number;
  deletedBy?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  deletionReason?: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

const DeletedTransactionsPage = () => {
  const { user, getAuthHeaders } = useAuth();
  const { currentBranch } = useBranch();
  const router = useRouter();

  const [transactions, setTransactions] = useState<SoftDeletedTransaction[]>(
    []
  );
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 20,
  });
  const [pageSize, setPageSize] = useState(20);

  // Redirect if user is not an owner
  useEffect(() => {
    if (user && user.role !== "owner") {
      toast.error("You do not have permission to view this page.");
      router.push("/settings");
    }
  }, [user, router]);

  const fetchDeletedTransactions = useCallback(
    async (page: number = 1, limit: number = pageSize) => {
      if (!currentBranch || user?.role !== "owner") return;

      setIsLoading(true);
      setError(null);
      try {
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/transactions/check-soft-deleted/branch/${currentBranch.id}?page=${page}&limit=${limit}`,
          { headers }
        );

        const data = await response;
        setTransactions(data.softDeletedTransactions || []);
        setPagination({
          currentPage: data.currentPage || 1,
          totalPages: data.totalPages || 1,
          totalCount: data.totalCount || 0,
          hasNextPage: data.hasNextPage || false,
          hasPrevPage: data.hasPrevPage || false,
          limit: data.limit || limit,
        });
      } catch (err: any) {
        setError(err.message);
        toast.error("Failed to load data: " + err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [currentBranch, user, pageSize]
  );

  useEffect(() => {
    fetchDeletedTransactions(1);
  }, [fetchDeletedTransactions]);

  const handleSelectionChange = (id: string) => {
    setSelectedTransactions((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleRestoreSelected = async () => {
    if (selectedTransactions.length === 0) {
      toast.info("No transactions selected for restoration.");
      return;
    }
    setIsRestoring(true);
    try {
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/transactions/restore-soft-deleted/branch/${currentBranch?.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: JSON.stringify({ transactionIds: selectedTransactions }),
        }
      );

      const result = await response;
      toast.success(
        `Successfully restored ${result.restoredCount} transaction(s).`
      );
      setSelectedTransactions([]);
      fetchDeletedTransactions(pagination.currentPage); // Refresh current page
    } catch (err: any) {
      toast.error("Restoration failed: " + err.message);
    } finally {
      setIsRestoring(false);
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (user?.role !== "owner") {
      toast.error("Insufficient permissions for permanent deletion.");
      return;
    }

    setIsDeleting(true);
    try {
      const headers = await getAuthHeaders();
      const response = await httpClient(`/transactions/permanent/${id}`, {
        method: "DELETE",
        headers,
      });

      const result = await response;
      if (result.success) {
        toast.success("Transaction permanently deleted.");
        fetchDeletedTransactions(pagination.currentPage); // Refresh current page
      } else {
        throw new Error(result.message || "Deletion failed");
      }
    } catch (err: any) {
      toast.error("Permanent deletion failed: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchDeletedTransactions(newPage);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    fetchDeletedTransactions(1, newSize);
  };

  const renderPaginationItems = () => {
    const items = [];
    const { currentPage, totalPages } = pagination;

    // Always show first page
    items.push(
      <PaginationItem key={1}>
        <PaginationLink
          onClick={() => handlePageChange(1)}
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Show ellipsis if needed
    if (currentPage > 3) {
      items.push(<PaginationEllipsis key="ellipsis-start" />);
    }

    // Show pages around current page
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      if (i !== 1 && i !== totalPages) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageChange(i)}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(<PaginationEllipsis key="ellipsis-end" />);
    }

    // Always show last page if there is more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => handlePageChange(totalPages)}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  if (user?.role !== "owner") {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Redirecting to settings page...</p>
          <p className="text-sm text-gray-500">Owner permissions required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Deleted Transactions Audit
          </h1>
          <p className="text-gray-600">
            Review, restore, or permanently delete transactions. Includes
            complete audit trail.
          </p>
        </div>
        <Button
          onClick={() => fetchDeletedTransactions(pagination.currentPage)}
          variant="outline"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Soft-Deleted Transactions (
              {pagination.totalCount.toLocaleString()} total)
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="border rounded px-2 py-1 text-sm"
                  disabled={isLoading}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-600">per page</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <Button
              onClick={handleRestoreSelected}
              disabled={selectedTransactions.length === 0 || isRestoring}
              className="bg-green-600 hover:bg-green-700"
            >
              {isRestoring ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Undo className="mr-2 h-4 w-4" />
              )}
              Restore Selected ({selectedTransactions.length})
            </Button>
            <Badge variant="destructive" className="flex items-center gap-1">
              <ShieldAlert className="h-3 w-3" />
              Owner Only
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
              <span className="ml-2">Loading audit trail...</span>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-4">
              <ShieldAlert className="h-8 w-8 mx-auto mb-2" />
              <p>Error loading transactions: {error}</p>
              <Button
                onClick={() => fetchDeletedTransactions(1)}
                variant="outline"
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <input
                          type="checkbox"
                          onChange={(e) =>
                            setSelectedTransactions(
                              e.target.checked
                                ? transactions.map((t) => t.id)
                                : []
                            )
                          }
                          checked={
                            transactions.length > 0 &&
                            selectedTransactions.length === transactions.length
                          }
                          className="cursor-pointer"
                        />
                      </TableHead>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Deleted Date</TableHead>
                      <TableHead>Deleted By</TableHead>
                      <TableHead>Deletion Reason</TableHead>
                      <TableHead>Original Creator</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length > 0 ? (
                      transactions.map((t) => (
                        <TableRow key={t.id} className="hover:bg-gray-50">
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedTransactions.includes(t.id)}
                              onChange={() => handleSelectionChange(t.id)}
                              className="cursor-pointer"
                            />
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {t.transactionId}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "UGX",
                            }).format(t.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {t.itemsCount} items
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span className="text-sm">
                                {format(new Date(t.createdAt), "MMM dd, yyyy")}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {format(new Date(t.createdAt), "HH:mm")}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-red-400" />
                              <span className="text-sm">
                                {format(new Date(t.deletedAt), "MMM dd, yyyy")}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {format(new Date(t.deletedAt), "HH:mm")}
                            </div>
                          </TableCell>
                          <TableCell>
                            {t.deletedBy ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3 text-blue-500" />
                                  <span className="font-medium text-sm">
                                    {t.deletedBy.name}
                                  </span>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  {t.deletedBy.role}
                                </Badge>
                              </div>
                            ) : (
                              <div className="text-gray-400 text-sm">
                                <User className="h-3 w-3 inline mr-1" />
                                Unknown
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {t.deletionReason ? (
                              <Badge
                                variant="outline"
                                className="max-w-[150px] truncate text-xs bg-orange-50"
                                title={t.deletionReason}
                              >
                                {t.deletionReason}
                              </Badge>
                            ) : (
                              <span className="text-gray-400 text-sm">
                                No reason
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {t.createdBy ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3 text-green-500" />
                                  <span className="font-medium text-sm">
                                    {t.createdBy.name}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-400 text-sm">
                                <User className="h-3 w-3 inline mr-1" />
                                Unknown
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  disabled={isDeleting}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="flex items-center text-red-600">
                                    <ShieldAlert className="mr-2 h-5 w-5" />
                                    Permanent Deletion
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="space-y-3">
                                    <div className="bg-red-50 p-3 rounded">
                                      <p className="font-semibold text-red-800">
                                        ⚠️ This action cannot be undone!
                                      </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <strong>Transaction ID:</strong>
                                        <div className="font-mono">
                                          {t.transactionId}
                                        </div>
                                      </div>
                                      <div>
                                        <strong>Amount:</strong>
                                        <div>
                                          {new Intl.NumberFormat("en-US", {
                                            style: "currency",
                                            currency: "UGX",
                                          }).format(t.amount)}
                                        </div>
                                      </div>
                                      <div>
                                        <strong>Items:</strong>
                                        <div>{t.itemsCount}</div>
                                      </div>
                                      <div>
                                        <strong>Deleted by:</strong>
                                        <div>
                                          {t.deletedBy?.name || "Unknown"}
                                        </div>
                                      </div>
                                    </div>
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handlePermanentDelete(t.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    {isDeleting ? (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash className="mr-2 h-4 w-4" />
                                    )}
                                    Delete Permanently
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={10}
                          className="text-center py-12 text-gray-500"
                        >
                          <div className="flex flex-col items-center">
                            <Undo className="h-16 w-16 mx-auto mb-4 opacity-30" />
                            <p className="text-lg font-medium">
                              No deleted transactions found
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing{" "}
                    {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
                    {Math.min(
                      pagination.currentPage * pagination.limit,
                      pagination.totalCount
                    )}{" "}
                    of {pagination.totalCount.toLocaleString()} transactions
                  </div>

                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            handlePageChange(pagination.currentPage - 1)
                          }
                          className={
                            !pagination.hasPrevPage
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>

                      {renderPaginationItems()}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            handlePageChange(pagination.currentPage + 1)
                          }
                          className={
                            !pagination.hasNextPage
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DeletedTransactionsPage;
