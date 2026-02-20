/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCabStore } from "@/context/CabStoreContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Filter,
  RefreshCw,
  Download,
  TrendingUp,
  TrendingDown,
  Calendar,
  Edit,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn, formatNumberWithCommas } from "@/lib/utils";
import {
  CabStoreTransactionType,
  CabStoreTransactionCategory,
  CabStoreRecord,
} from "@/context/CabStoreContext";
import { capitalizeWords } from "@/src/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import CabStoreRecordForm from "@/components/CabStoreRecordForm";

export default function CabStoreHistory() {
  const { records, loading, refetchRecords, deleteRecord, updateRecord } =
    useCabStore();
  const { currentBranchId } = useAuth();
  const { toast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [recordToDelete, setRecordToDelete] = useState<CabStoreRecord | null>(
    null
  );
  const [recordToEdit, setRecordToEdit] = useState<CabStoreRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async (showRefresh = false) => {
    if (currentBranchId) {
      if (showRefresh) {
        setRefreshing(true);
      }
      await refetchRecords(currentBranchId);
      if (showRefresh) {
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [currentBranchId]);

  const handleDeleteRecord = async () => {
    if (!recordToDelete) return;

    setIsDeleting(true);
    try {
      await deleteRecord(recordToDelete.id);
      toast({
        title: "Success",
        description: "Record deleted successfully",
      });
      setRecordToDelete(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete record",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateRecord = async (updatedData: any) => {
    if (!recordToEdit) return;

    try {
      await updateRecord(recordToEdit.id, updatedData);
      toast({
        title: "Success",
        description: "Record updated successfully",
      });
      setRecordToEdit(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update record",
        variant: "destructive",
      });
      throw error; // Re-throw to let the form handle it
    }
  };

  // Filter records based on search and filters
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || record.type === filterType;
    const matchesCategory =
      filterCategory === "all" || record.category === filterCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  const getTypeBadge = (type: CabStoreTransactionType) => {
    const config = {
      [CabStoreTransactionType.DEPOSIT]: {
        label: "Deposit",
        color: "bg-green-100 text-green-700 border-green-200",
        icon: TrendingUp,
      },
      [CabStoreTransactionType.WITHDRAWAL]: {
        label: "Withdrawal",
        color: "bg-red-100 text-red-700 border-red-200",
        icon: TrendingDown,
      },
      [CabStoreTransactionType.BALANCE_FORWARD]: {
        label: "Balance Forward",
        color: "bg-blue-100 text-blue-700 border-blue-200",
        icon: Calendar,
      },
    };

    const { label, color, icon: Icon } = config[type];
    return (
      <Badge variant="outline" className={color}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const SkeletonRow = () => (
    <div className="flex items-center justify-between p-4 border-b border-gray-200/60">
      <div className="flex items-center space-x-4 flex-1">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="text-right space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50/30 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Transaction History
            </h1>
            <p className="text-gray-600 text-lg">
              View and manage all store transactions
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <Button
              variant="outline"
              size="sm"
              className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData(true)}
              disabled={refreshing || loading}
              className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl"
            >
              <RefreshCw
                className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 border-2 border-gray-200/60 focus:border-blue-300 rounded-xl bg-white/50"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="h-12 border-2 border-gray-200/60 focus:border-blue-300 rounded-xl bg-white px-3"
              >
                <option value="all">All Types</option>
                <option value={CabStoreTransactionType.DEPOSIT}>
                  Deposits
                </option>
                <option value={CabStoreTransactionType.WITHDRAWAL}>
                  Withdrawals
                </option>
                <option value={CabStoreTransactionType.BALANCE_FORWARD}>
                  Balance Forward
                </option>
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="h-12 border-2 border-gray-200/60 focus:border-blue-300 rounded-xl bg-white px-3"
              >
                <option value="all">All Categories</option>
                {Object.values(CabStoreTransactionCategory).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <Button
                variant="outline"
                className="h-12 border-2 border-gray-200/60 hover:border-blue-300 rounded-xl"
              >
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Records List */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Transactions</span>
              <Badge
                variant="secondary"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                {filteredRecords.length} records
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <SkeletonRow key={index} />
              ))
            ) : filteredRecords.length > 0 ? (
              <div className="divide-y divide-gray-200/60">
                {filteredRecords.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 hover:bg-gray-50/50 transition-colors duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div
                          className={cn(
                            "p-2 rounded-lg",
                            record.type === CabStoreTransactionType.DEPOSIT
                              ? "bg-green-100 text-green-600"
                              : record.type ===
                                  CabStoreTransactionType.WITHDRAWAL
                                ? "bg-red-100 text-red-600"
                                : "bg-blue-100 text-blue-600"
                          )}
                        >
                          {record.type === CabStoreTransactionType.DEPOSIT && (
                            <TrendingUp className="h-4 w-4" />
                          )}
                          {record.type ===
                            CabStoreTransactionType.WITHDRAWAL && (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          {record.type ===
                            CabStoreTransactionType.BALANCE_FORWARD && (
                            <Calendar className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-800">
                              {capitalizeWords(record.details) ||
                                capitalizeWords(record.category)}
                            </h3>
                            {getTypeBadge(record.type)}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>
                              {new Date(
                                record.transactionDate
                              ).toLocaleDateString()}
                            </span>
                            {record.reference && (
                              <>
                                <span>•</span>
                                <span>{record.reference}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p
                            className={cn(
                              "font-bold text-lg",
                              record.type === CabStoreTransactionType.DEPOSIT
                                ? "text-green-600"
                                : record.type ===
                                    CabStoreTransactionType.WITHDRAWAL
                                  ? "text-red-600"
                                  : "text-blue-600"
                            )}
                          >
                            {record.type === CabStoreTransactionType.DEPOSIT
                              ? "+"
                              : "-"}
                            UGX{" "}
                            {formatNumberWithCommas(
                              Math.abs(record.amount).toString()
                            )}
                          </p>
                          <p className="text-sm text-gray-600">
                            Balance: UGX{" "}
                            {formatNumberWithCommas(record.balance.toString())}
                          </p>
                        </div>

                        {/* Actions Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setRecordToEdit(record)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setRecordToDelete(record)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    {record.notes && (
                      <div className="mt-2 pl-12">
                        <p className="text-sm text-gray-600">{record.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No transactions found
                </h3>
                <p className="text-gray-500">
                  {searchTerm ||
                  filterType !== "all" ||
                  filterCategory !== "all"
                    ? "Try adjusting your search terms or filters"
                    : "No transactions recorded yet"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!recordToDelete}
          onOpenChange={() => setRecordToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                transaction record
                {recordToDelete && (
                  <>
                    {" "}
                    for{" "}
                    <strong>
                      {recordToDelete.details || recordToDelete.category}
                    </strong>{" "}
                    dated{" "}
                    {new Date(
                      recordToDelete.transactionDate
                    ).toLocaleDateString()}{" "}
                    amounting to UGX{" "}
                    {formatNumberWithCommas(recordToDelete.amount.toString())}.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteRecord}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Record Dialog */}
        {recordToEdit && (
          <CabStoreRecordForm
            record={recordToEdit}
            open={!!recordToEdit}
            onOpenChange={() => setRecordToEdit(null)}
            onSubmit={handleUpdateRecord}
            mode="edit"
          />
        )}
      </div>
    </div>
  );
}
